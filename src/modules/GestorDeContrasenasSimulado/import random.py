import random
import string

def generar_codigo_especifico(longitud=10):
    # Definimos los caracteres obligatorios
    obligatorios = ['T', 'K', 'A']
    
    # El resto de los caracteres pueden ser cualquier letra mayúscula o número
    pool = string.ascii_uppercase + string.digits
    
    # Calculamos cuántos caracteres aleatorios faltan (en este caso, 7)
    faltantes = [random.choice(pool) for _ in range(longitud - len(obligatorios))]
    
    # Unimos los obligatorios con los aleatorios
    lista_final = obligatorios + faltantes
    
    # Mezclamos la lista para que T, K y A no estén siempre al principio
    random.shuffle(lista_final)
    
    return ''.join(lista_final)

# Generar 5 ejemplos
for _ in range(5):
    print(generar_codigo_especifico())