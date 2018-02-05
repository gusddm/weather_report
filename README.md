# weather_report
calculate average for last 24hs and instant temperature

Se exponen dos endpoints para obtener en formato JSON, tanto la temperatura, humedad y condicion actuales, como la temperatura promedio de las ultimas 24hs.

Ejemplos de uso:

Para temperatura actual:

http://localhost:3000/current

Para temperatura promedio:

http://localhost:3000/get_average_temp

Para ejecutar el servidor de node, usar el siguiente comando, situados sobre el raiz del proyecto:

npm start run

Para ello es necesario tener el gestor de paquetes npm:

https://docs.npmjs.com/getting-started/installing-node
