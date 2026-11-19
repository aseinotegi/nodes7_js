# Nodes7 PLC Acquisition with Web Service

Este repositorio contiene una solución basada en **Node.js** para la adquisición de datos desde un PLC Siemens utilizando la librería **nodes7**. Los datos son leídos desde un bloque de datos (DB) del PLC y publicados en un servidor MQTT cuando se detectan cambios. Además, incluye un **web service** desarrollado con **Express** que permite configurar los parámetros del PLC de manera dinámica a través de una interfaz web.

Más proyectos míos en **[andersein.com](https://andersein.com)**.

## Estructura del proyecto

### Archivos principales

- **`PLCx.js`**
  - Contiene la clase `PLC_INSTANCE`, encargada de:
    - Conectarse al PLC
    - Leer datos desde un DB especificado
    - Detectar cambios en los valores leídos
    - Publicar los datos modificados en un servidor MQTT

- **`main.js`**
  - Punto de entrada del proyecto
  - Inicia el servidor Express y espera la configuración del PLC desde un formulario web

- **`express.js`**
  - Define el servidor web utilizando **Express**
  - Expone las rutas necesarias para servir la interfaz web y manejar las configuraciones

- **`configure.js`**
  - Implementa la lógica para procesar los datos enviados desde el formulario web
  - Crea instancias de `PLC_INSTANCE`

### Directorios adicionales

- **`Templates/`**
  - Contiene los archivos HTML estáticos:
    - Formulario principal (`index.html`)
    - Página de confirmación (`success.html`)

## Flujo de trabajo

### 1. Configuración inicial

1. Clona el repositorio:
   ```bash
   git clone https://github.com/aseinotegi/nodes7_js.git
   cd nodes7_js
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

### 2. Uso del servidor web

1. Inicia el servidor:
   ```bash
   node main.js
   ```

2. Abre el navegador y accede a:
   ```
   http://localhost:3000
   ```

3. Llena el formulario con la configuración del PLC:
   - IP del PLC
   - Rack y slot
   - Dirección del DB (Data Block)
   - Cantidad de variables a leer (booleanos, bytes, enteros de 16 y 32 bits, flotantes)

4. Haz clic en "Submit" para guardar la configuración

### 3. Lectura y publicación de datos

Una vez configurado, se crea una instancia de `PLC_INSTANCE` que:
1. Conecta al PLC especificado
2. Traduce las direcciones de las variables (por ejemplo: `DB1,X0.0`, `DB1,INT2`)
3. Lee continuamente los datos del PLC en intervalos de tiempo configurados
4. Publica los datos modificados en el servidor MQTT configurado

### 4. MQTT

- Los datos leídos del PLC se publican en un servidor MQTT bajo el tema (`topic`) configurado
- La configuración por defecto utiliza:
  - Host MQTT: `mqtt://localhost`
  - Tema: `datos_plc`

## Personalización

### Configuración del PLC

El formulario en la interfaz web permite configurar dinámicamente:
- Dirección IP del PLC
- Rack y slot
- Dirección del Data Block (DB)
- Cantidad de variables a leer:
  - Booleanos
  - Bytes
  - Enteros de 16/32 bits
  - Flotantes

### Publicación en MQTT

Puedes cambiar el host MQTT y el tema al instanciar la clase `PLC_INSTANCE` en `configure.js`:

```javascript
const PLC1 = new PLC_INSTANCE(ip, rack, slot, db, bools, bytes, int16, int32, float, 'mqtt://localhost', 'datos_plc');
```

### Lectura del PLC

La clase `PLC_INSTANCE` permite leer las siguientes variables:
- **Booleanos** (`DBx,Xx.x`): Bits individuales en el DB
- **Bytes** (`DBx,Bx`): Bytes sin procesar
- **Enteros de 16 bits** (`DBx,INTx`): Valores enteros de 16 bits
- **Enteros de 32 bits** (`DBx,DINTx`): Valores enteros de 32 bits
- **Flotantes** (`DBx,REALx`): Valores en punto flotante

### Tiempos de lectura

El intervalo de lectura está configurado por defecto a **30 ms**:

```javascript
setInterval(() => PLC1.ReadDataChange(), 30);
```

## Requisitos

- **Node.js** v14 o superior
- Librerías usadas:
  - `nodes7`: Para la comunicación con el PLC
  - `mqtt`: Para publicar datos en un servidor MQTT
  - `express` y `body-parser`: Para el servidor web
- Un PLC Siemens accesible en la red local
- Un servidor MQTT corriendo (por defecto, en `localhost`)

## Ejemplo de ejecución

1. Inicia el servidor:
   ```bash
   node main.js
   ```

2. Accede al formulario en el navegador:
   ```
   http://localhost:3000
   ```

3. Configura un PLC con los siguientes parámetros:
   - IP: `192.168.0.1`
   - Rack: `0`
   - Slot: `1`
   - DB: `1`
   - Bools: `16`
   - Bytes: `4`
   - Int16: `8`
   - Int32: `4`
   - Float: `2`

4. Observa los datos publicados en el tema MQTT configurado (`datos_plc`)

## Notas adicionales

- **Seguridad:** Si tu servidor MQTT requiere autenticación, puedes configurar `mqttUsername` y `mqttPassword` al instanciar `PLC_INSTANCE`
- **Ampliaciones:** Puedes personalizar el código para manejar múltiples PLCs simultáneamente
