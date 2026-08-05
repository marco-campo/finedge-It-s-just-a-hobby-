import os
from flask import Flask, render_template, request, jsonify
from groq import Groq
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Inicializar Flask
app = Flask(__name__, template_folder='templates')

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("No se encontró la variable GROQ_API_KEY en el archivo .env")

client = Groq(api_key=api_key)

INSTRUCCIONES_SISTEMA = """
Eres el asistente virtual interactivo con Inteligencia Artificial de la Plataforma Web de Educacion Comercial y Financiera para Jovenes.
Tu objetivo es ayudar a estudiantes de grado 11, jovenes egresados y emprendedores del municipio de Caucasia, Antioquia, a educarse financieramente de manera gratuita y accesible.
Directrices: lenguaje claro y cotidiano, motivador, alerta sobre riesgos financieros (fraudes, pirámides), respuestas precisas.
tus mensajes los diras ni tan largos pero no muy cortos pero si el usuario te pide especificacion se la das.
"""

MAX_HISTORIAL = 10 
historial_mensajes = [{"role": "system", "content": INSTRUCCIONES_SISTEMA}]

# --- RUTAS DE NAVEGACIÓN ---

# --- RUTAS DE NAVEGACIÓN (CORREGIDAS) ---

@app.route('/')
def inicio():
    return render_template('index.html')

# Eliminamos la ruta '/ia' y dejamos solo '/finn' para evitar confusión
@app.route('/finn') 
def finn():
    return render_template('index_ia.html')

@app.route('/credito-casa')
def credito_casa():
    return render_template('credito-casa.html')

@app.route('/presupuesto')
def presupuesto():
    return render_template('presupuesto.html')

@app.route('/inversiones')
def inversiones():
    return render_template('inversiones.html')

@app.route('/estadisticas')
def estadisticas():
    return render_template('estadisticas.html')

@app.route('/emprendimiento')
def emprendimiento():
    return render_template('emprendimiento.html')


# --- LÓGICA DE LA IA ---

@app.route('/chat', methods=['POST'])
def chat():
    global historial_mensajes
    data = request.get_json()
    mensaje_usuario = data.get('mensaje')

    if not mensaje_usuario:
        return jsonify({"respuesta": "No recibí ningún mensaje."}), 400

    historial_mensajes.append({"role": "user", "content": mensaje_usuario})

    if len(historial_mensajes) > MAX_HISTORIAL:
        historial_mensajes = [historial_mensajes[0]] + historial_mensajes[-(MAX_HISTORIAL-1):]

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=historial_mensajes,
            temperature=0.7
        )
        respuesta_ia = completion.choices[0].message.content
        historial_mensajes.append({"role": "assistant", "content": respuesta_ia})
        return jsonify({"respuesta": respuesta_ia})
    
    except Exception as e:
        return jsonify({"respuesta": "Lo siento, tuve un problema de conexión. Inténtalo de nuevo."}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)