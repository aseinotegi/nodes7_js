const nodes7 = require('nodes7');
const mqtt = require('mqtt');

class PLC_INSTANCE {
  constructor(IP, Rack, Slot, DB, B_Bools, B_Bytes, B_Int16, B_Int32, B_Float, host, topic, mqttUsername, mqttPassword) {
    this.IP = IP;
    this.Rack = Rack;
    this.Slot = Slot;
    this.DB = DB;
    this.B_Bools = B_Bools;
    this.B_Bytes = B_Bytes;
    this.B_Int16 = B_Int16;
    this.B_Int32 = B_Int32;
    this.B_Float = B_Float;
    this.host = host;
    this.topic = topic;
    this.mqttUsername = mqttUsername
    this.mqttPassword = mqttPassword
    this._startBools = 0;
    this._startBytes = B_Bools;
    this._startInt16 = B_Bools + B_Bytes;
    this._startInt32 = B_Bools + B_Bytes + B_Int16;
    this._startFloat = B_Bools + B_Bytes + B_Int16 + B_Int32;
    this._lenght = B_Bools + B_Bytes + B_Int16 + B_Int32 + B_Float;
    this.address = {};
    this.ChangeData = {};
    this.ChangeData_mem = {};
    this.client = new nodes7();
  }

  getUTCTimestamp() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  defineVariables() {
    const StopBools = this._startBytes;
    const StopBytes = this._startInt16;
    const StopInt16 = this._startInt32;
    const StopInt32 = this._startFloat;
    const StopFloat = this._lenght;

    let variableName;

    // Leer Bools
    for (let _byte = this._startBools; _byte < StopBools; _byte++) {
      for (let _bit = 0; _bit < 15; _bit++) {
        variableName = `Bool_011_o(${_byte.toString().padStart(3, '0')})_${_bit}`;
        this.address[variableName] = `DB${this.DB},X${_byte}.${_bit}`;
      }
    }

    // Leer bytes
    for (let _byte = this._startBytes; _byte < StopBytes; _byte++) {
      variableName = `Byte_011_o(${_byte.toString().padStart(3, '0')})`;
      this.address[variableName] = `DB${this.DB},B${_byte}`;
    }

    // Leer enteros
    for (let _byte = this._startInt16; _byte < StopInt16; _byte += 2) {
      variableName = `Int16_011_o(${_byte.toString().padStart(3, '0')})`;
      this.address[variableName] = `DB${this.DB},INT${_byte}`;
    }

    // Leer DINT
    for (let _byte = this._startInt32; _byte < StopInt32; _byte += 4) {
      variableName = `Int32_011_o(${_byte.toString().padStart(3, '0')})`;
      this.address[variableName] = `DB${this.DB},DINT${_byte}`;
    }

    // Leer REAL
    for (let _byte = this._startFloat; _byte < StopFloat; _byte += 4) {
      variableName = `Float_011_o(${_byte.toString().padStart(3, '0')})`;
      this.address[variableName] = `DB${this.DB},REAL${_byte}`;
    }
  }

  connectToPLC() {
    this.client.initiateConnection(
      { port: 102, host: this.IP, rack: this.Rack, slot: this.Slot, debug: false },
      (err) => {
        if (err) {
          console.log("Error al conectar al PLC:", err);
          process.exit();
        } else {
          console.log("Conexión al PLC establecida correctamente.");

          this.client.setTranslationCB(tag => this.address[tag]);

          const itemsToRead = Object.keys(this.address);
          this.client.addItems(itemsToRead);
        }
      }
    );
  }

  publishToMQTT(message) {
    const mqttOptions = { username: this.mqttUsername, password: this.mqttPassword };
    const publisher = mqtt.connect(this.host, mqttOptions);

    publisher.on('connect', () => {
      publisher.publish(this.topic, JSON.stringify(message));
      publisher.end();
    });

    publisher.on('error', (error) => {
      console.error('Error al publicar en MQTT:', error);
    });
  }

  ReadDataChange() {
    

    this.client.readAllItems((anythingBad, values) => {
      if (anythingBad) {
        console.log("Error al leer los valores de las variables!");
      } else {
        // Comparar los valores leídos con los valores anteriores
        for (const variableName in values) {
          if (values.hasOwnProperty(variableName) && this.ChangeData_mem.hasOwnProperty(variableName)) {
            if (values[variableName] !== this.ChangeData_mem[variableName]) {
              this.ChangeData[variableName] = values[variableName];
            }
          }
        }
        // Si hay variables que han cambiado, agregar el timestamp
        if (Object.keys(this.ChangeData).length > 0) {
          this.ChangeData.Timestamp = this.getUTCTimestamp();
          this.publishToMQTT(this.ChangeData);
        }

        // Actualizar los valores anteriores con los nuevos valores leídos
        this.ChangeData_mem = { ...values };
      }
    });
  }
}

module.exports = PLC_INSTANCE;

