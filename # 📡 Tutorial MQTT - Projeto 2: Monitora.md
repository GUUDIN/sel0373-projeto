# 📡 Tutorial MQTT - Projeto 2: Monitoramento Climático

## 🎯 Objetivo
Este tutorial vai te ensinar como enviar dados dos seus sensores climáticos via MQTT para nossa plataforma IoT.

## 📋 Informações de Conexão

```
🌐 Broker MQTT: mqtt://igbt.eesc.usp.br
👤 Usuário: mqtt
🔐 Senha: mqtt_123_abc
📢 Tópico: clima
🔌 Porta: 1883 (padrão MQTT)
```

## 🏗️ Estrutura da Mensagem JSON

### Mensagem Básica (Mínima)
```json
{
  "deviceId": "sensor_001",
  "timestamp": "2025-06-04T14:30:00.000Z",
  "location": {
    "latitude": -22.0067,
    "longitude": -47.8917,
    "name": "EESC-USP Campus"
  },
  "sensors": {
    "temperature": {
      "value": 23.5,
      "unit": "°C"
    },
    "humidity": {
      "value": 65.2,
      "unit": "%"
    }
  },
  "status": "online"
}
```

### Mensagem Completa (Recomendada)
```json
{
  "deviceId": "weather_station_01",
  "timestamp": "2025-06-04T14:30:00.000Z",
  "location": {
    "latitude": -22.0067,
    "longitude": -47.8917,
    "name": "Laboratório IoT - EESC"
  },
  "sensors": {
    "temperature": {
      "value": 23.5,
      "unit": "°C"
    },
    "humidity": {
      "value": 65.2,
      "unit": "%"
    },
    "pressure": {
      "value": 1013.25,
      "unit": "hPa"
    },
    "windSpeed": {
      "value": 12.5,
      "unit": "km/h"
    },
    "windDirection": {
      "value": 230,
      "unit": "°"
    },
    "rainfall": {
      "value": 0.0,
      "unit": "mm"
    },
    "uvIndex": {
      "value": 6.5,
      "unit": "UV"
    },
    "lightIntensity": {
      "value": 450,
      "unit": "lux"
    }
  },
  "battery": {
    "level": 85,
    "voltage": 3.7,
    "unit": "%"
  },
  "status": "online"
}
```

## 📊 Campos Explicados

### ✅ **OBRIGATÓRIOS**
- `deviceId`: ID único do seu dispositivo (ex: "sensor_001", "esp32_lab")
- `timestamp`: Data/hora em formato ISO 8601
- `location.latitude`: Coordenada GPS (número decimal)
- `location.longitude`: Coordenada GPS (número decimal)
- `sensors`: Pelo menos um sensor com `value` e `unit`

### 📌 **OPCIONAIS** (mas recomendados)
- `location.name`: Nome legível da localização
- `battery`: Status da bateria do dispositivo
- `status`: Estado do dispositivo ("online", "offline", "alert")

## 🔧 Implementação Arduino/ESP32

### Bibliotecas Necessárias
```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
```

### Código Básico
```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <WiFiUdp.h>
#include <NTPClient.h>

// Configurações WiFi
const char* ssid = "SUA_REDE_WIFI";
const char* password = "SUA_SENHA_WIFI";

// Configurações MQTT
const char* mqtt_server = "igbt.eesc.usp.br";
const char* mqtt_user = "mqtt";
const char* mqtt_password = "mqtt_123_abc";
const char* mqtt_topic = "clima";

// Cliente MQTT
WiFiClient espClient;
PubSubClient client(espClient);

// NTP para timestamp
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", -3*3600, 60000); // UTC-3 (Brasil)

void setup() {
  Serial.begin(115200);
  
  // Conecta WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi conectado!");
  
  // Configura MQTT
  client.setServer(mqtt_server, 1883);
  
  // Inicia NTP
  timeClient.begin();
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();
  timeClient.update();
  
  // Envia dados a cada 30 segundos
  static unsigned long lastMsg = 0;
  unsigned long now = millis();
  if (now - lastMsg > 30000) {
    lastMsg = now;
    sendWeatherData();
  }
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Conectando MQTT...");
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("Conectado!");
    } else {
      Serial.print("Falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void sendWeatherData() {
  StaticJsonDocument<512> doc;
  
  // Dados básicos
  doc["deviceId"] = "sensor_001"; // Mude para o ID do seu dispositivo
  doc["timestamp"] = getISOTimestamp();
  
  // Localização (ajuste as coordenadas para sua localização real)
  doc["location"]["latitude"] = -22.0067;
  doc["location"]["longitude"] = -47.8917;
  doc["location"]["name"] = "EESC-USP Campus";
  
  // Leituras dos sensores (substitua pelas suas funções de leitura)
  doc["sensors"]["temperature"]["value"] = readTemperature();
  doc["sensors"]["temperature"]["unit"] = "°C";
  
  doc["sensors"]["humidity"]["value"] = readHumidity();
  doc["sensors"]["humidity"]["unit"] = "%";
  
  // Status
  doc["status"] = "online";
  
  // Converte para string e publica
  String payload;
  serializeJson(doc, payload);
  
  client.publish(mqtt_topic, payload.c_str());
  Serial.println("Dados enviados: " + payload);
}

String getISOTimestamp() {
  unsigned long epochTime = timeClient.getEpochTime();
  // Converte para formato ISO 8601
  // Esta é uma implementação simplificada
  return "2025-06-04T" + timeClient.getFormattedTime() + ".000Z";
}

// Substitua estas funções pelas leituras reais dos seus sensores
float readTemperature() {
  // Exemplo com DHT22 ou similar
  return 25.0 + random(-5, 5); // Simula temperatura
}

float readHumidity() {
  // Exemplo com DHT22 ou similar
  return 60.0 + random(-10, 10); // Simula umidade
}
```

## 🧪 Como Testar

### 1. Teste Manual (Terminal Linux/Mac)
```bash
# Instalar mosquitto client
sudo apt-get install mosquitto-clients  # Ubuntu/Debian
brew install mosquitto                   # macOS

# Enviar mensagem de teste
mosquitto_pub -h igbt.eesc.usp.br -u mqtt -P mqtt_123_abc -t clima -m '{
  "deviceId": "test_manual",
  "timestamp": "2025-06-04T14:30:00.000Z",
  "location": {
    "latitude": -22.0067,
    "longitude": -47.8917,
    "name": "Teste Manual"
  },
  "sensors": {
    "temperature": {"value": 25.5, "unit": "°C"},
    "humidity": {"value": 70.0, "unit": "%"}
  },
  "status": "online"
}'
```

### 2. Verificar se Chegou
1. Acesse: `http://localhost:6005/projeto2`
2. Abra o console do navegador (F12)
3. Envie a mensagem teste
4. Você deve ver os dados aparecerem em tempo real!

### 3. MQTT Explorer (Ferramenta Visual)
1. Baixe: https://mqtt-explorer.com/
2. Configure:
   - Host: `igbt.eesc.usp.br`
   - Port: `1883`
   - Username: `mqtt`
   - Password: `mqtt_123_abc`
3. Conecte e publique no tópico `clima`

## 📅 Frequência Recomendada

```
📊 Dados normais: A cada 30-60 segundos
🚨 Alertas: Imediatamente
💓 Heartbeat: A cada 5 minutos (só status)
```

## 🚨 Mensagens de Alerta

Para situações críticas (temperatura muito alta, etc.):

```json
{
  "deviceId": "sensor_001",
  "timestamp": "2025-06-04T14:30:00.000Z",
  "location": {
    "latitude": -22.0067,
    "longitude": -47.8917,
    "name": "Sensor Crítico"
  },
  "alert": {
    "type": "temperature_high",
    "severity": "warning",
    "message": "Temperatura acima do limite (35°C)",
    "threshold": 35.0,
    "currentValue": 37.2
  },
  "sensors": {
    "temperature": {"value": 37.2, "unit": "°C"}
  },
  "status": "alert"
}
```

## ✅ Checklist Final

- [ ] WiFi configurado e conectando
- [ ] Bibliotecas MQTT instaladas
- [ ] Coordenadas GPS corretas da sua localização
- [ ] `deviceId` único para cada dispositivo
- [ ] Timestamp em formato ISO 8601
- [ ] Pelo menos temperatura e umidade sendo enviados
- [ ] Teste manual funcionando
- [ ] Dados aparecendo no site do projeto 2

## 🆘 Problemas Comuns

### Não conecta no MQTT
- Verifique se WiFi está funcionando
- Confirme usuário/senha: `mqtt` / `mqtt_123_abc`
- Teste conexão manual com mosquitto_pub

### Dados não aparecem no site
- Verifique se está enviando para o tópico `clima`
- Confirme se JSON está válido
- Abra console do navegador para ver erros

### JSON inválido
- Use aspas duplas (") não simples (')
- Verifique vírgulas e chaves
- Teste JSON em: https://jsonlint.com/

## 📞 Suporte

Se tiverem dúvidas:
1. Testem primeiro com mosquitto_pub
2. Verifiquem se dados chegam no console do navegador
3. Mandem print do erro no console

**Boa sorte com o projeto! 🚀**