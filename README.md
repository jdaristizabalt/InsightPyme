# InsightPyme

InsightPyme es una aplicación web orientada al análisis de ventas para pequeños negocios. El objetivo del proyecto es transformar archivos de ventas en información útil para la toma de decisiones mediante indicadores, análisis automáticos y visualizaciones.

Actualmente el proyecto se encuentra en una etapa inicial de desarrollo y cuenta con una API funcional capaz de recibir archivos CSV o Excel, validar su estructura y generar métricas y análisis básicos de ventas.

## Objetivo

Muchas pequeñas empresas registran sus ventas en archivos de Excel o CSV, pero no cuentan con herramientas sencillas para interpretar esa información.

InsightPyme busca convertir esos datos en información clara y accionable, permitiendo responder preguntas como:

* ¿Cuánto vendió el negocio?
* ¿Cuántas unidades fueron vendidas?
* ¿Cuál es el producto más vendido?
* ¿Qué producto genera mayor facturación?
* ¿Cómo evolucionan las ventas por día?
* ¿Qué categorías generan mayores ingresos?
* ¿Cuáles son los productos más importantes para el negocio?

## Estado actual

Versión actual: `v0.1.0`

Actualmente InsightPyme permite:

* Cargar archivos CSV.
* Cargar archivos XLSX.
* Validar columnas obligatorias.
* Validar datos numéricos y fechas.
* Calcular ventas totales.
* Calcular unidades vendidas.
* Calcular promedio de venta por registro.
* Identificar el producto más vendido por unidades.
* Identificar el producto con mayor facturación.
* Analizar ventas por día.
* Analizar ventas por categoría.
* Generar un ranking de productos por facturación.
* Detectar el rango de fechas contenido en el archivo.

## Tecnologías

### Backend

* Python 3.12
* FastAPI
* Pandas
* Uvicorn
* OpenPyXL
* python-multipart

### Herramientas

* Git
* GitHub
* VS Code

Todas las tecnologías utilizadas en el desarrollo actual son gratuitas y de código abierto o cuentan con uso gratuito para desarrollo.

## Arquitectura actual

```text
Archivo CSV / Excel
        |
        v
    FastAPI API
        |
        v
 Validación de datos
        |
        v
      Pandas
        |
        v
 Motor de analítica
        |
        v
   Respuesta JSON
```

En futuras versiones se incorporarán frontend, persistencia de datos, autenticación y nuevas capacidades de análisis.

## Estructura del proyecto

```text
InsightPyme/
|
|-- backend/
|   |-- app/
|   |   |-- services/
|   |   |   |-- analytics.py
|   |   |
|   |   |-- main.py
|   |
|   |-- requirements.txt
|
|-- data/
|   |-- sample_sales.csv
|
|-- docs/
|
|-- frontend/
|
|-- .gitignore
|
|-- README.md
```

## Formato esperado de los datos

Para realizar el análisis, el archivo debe contener inicialmente las siguientes columnas:

| Columna           | Descripción                |
| ----------------- | -------------------------- |
| `fecha`           | Fecha de la venta          |
| `producto`        | Nombre del producto        |
| `categoria`       | Categoría del producto     |
| `cantidad`        | Unidades vendidas          |
| `precio_unitario` | Precio de venta por unidad |

Ejemplo:

```csv
fecha,producto,categoria,cantidad,precio_unitario
2026-08-01,Pizza Hawaiana,Pizza,2,35000
2026-08-01,Coca Cola 1.5L,Bebidas,1,8000
2026-08-01,Hamburguesa Especial,Hamburguesa,3,22000
```

## API

Actualmente la API expone los siguientes endpoints.

### Estado de la aplicación

```http
GET /
```

### Health check

```http
GET /health
```

### Analizar archivo de ventas

```http
POST /analytics/upload
```

Este endpoint recibe un archivo CSV o XLSX y devuelve indicadores y análisis.

Ejemplo de respuesta:

```json
{
  "filename": "sample_sales.csv",
  "rows_processed": 12,
  "kpis": {
    "total_revenue": 541000,
    "transactions": 12,
    "units_sold": 23,
    "average_ticket": 45083.33,
    "top_product": "Coca Cola 1.5L"
  },
  "analytics": {
    "date_range": {
      "start": "2026-08-01",
      "end": "2026-08-04"
    },
    "highest_revenue_product": "Pizza BBQ"
  }
}
```

## Ejecutar el proyecto localmente

Clonar el repositorio:

```bash
git clone https://github.com/jdaristizabalt/InsightPyme.git
```

Entrar al backend:

```bash
cd InsightPyme/backend
```

Crear el entorno virtual:

```bash
python -m venv .venv
```

En Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

Ejecutar la API:

```bash
uvicorn app.main:app --reload
```

La aplicación estará disponible en:

```text
http://127.0.0.1:8000
```

La documentación interactiva de FastAPI estará disponible en:

```text
http://127.0.0.1:8000/docs
```

## Roadmap

### v0.1 — Backend analítico

* [x] API con FastAPI
* [x] Carga de CSV
* [x] Carga de Excel
* [x] Validación de datos
* [x] KPIs principales
* [x] Ventas por día
* [x] Ventas por categoría
* [x] Ranking de productos

### v0.2 — Frontend

* [ ] Crear aplicación con Next.js
* [ ] Diseñar interfaz de carga de archivos
* [ ] Mostrar KPIs visualmente
* [ ] Crear gráficos interactivos
* [ ] Conectar frontend con FastAPI

### v0.3 — Persistencia

* [ ] Integrar PostgreSQL
* [ ] Guardar históricos de cargas
* [ ] Crear negocios y usuarios
* [ ] Incorporar autenticación

### v0.4 — Inteligencia de negocio

* [ ] Comparaciones entre periodos
* [ ] Detección de tendencias
* [ ] Insights automáticos
* [ ] Alertas sobre cambios relevantes

### v1.0 — Inteligencia artificial

* [ ] Consultas en lenguaje natural
* [ ] Preguntas sobre los datos
* [ ] Recomendaciones automáticas
* [ ] Integración con modelos de IA gratuitos o ejecutados localmente

## Visión del proyecto

InsightPyme busca evolucionar de una herramienta de análisis de archivos a una plataforma sencilla de inteligencia de negocio para pequeñas empresas.

La visión es permitir que un negocio pueda cargar sus datos y obtener rápidamente métricas, visualizaciones y recomendaciones sin necesidad de conocimientos técnicos en análisis de datos.

## Autor

**Juan Diego**

Profesional en Administración de Sistemas Informáticos.

Proyecto desarrollado como parte de un portafolio profesional enfocado en desarrollo de software, análisis de datos, inteligencia de negocio e inteligencia artificial.
