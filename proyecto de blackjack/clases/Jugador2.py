from clases.Cartas import Cartas

CartaVolteada = Cartas(0, "Null", "Null")

class Jugador:
    def __init__(self, nombre, turno):
        self.nombre = nombre
        self.mano = []
        self.puntos = 0
        self.terminado = False
        self.visible = False
        self.x = 200
        self.y = 550
        self.turno = turno

    def dibujar(self, screen, x):
        if self.visible:
            self.x = x
            for carta in self.mano:
                carta.dibujar(screen, self.x, self.y)
                self.x += 50

    def dibujar2(self, screen, x, y):
        if self.visible:
            self.x = x
            self.y = y
            CartaVolteada.dibujarVolteada(screen, 400, 200)
            for carta in self.mano:
                carta.dibujar(screen, self.x, self.y)
                self.x += 50
        
    
    def turnoFinalizado(self):
        self.turno = False

    def mostrar (self):
        self.visible = True

    def recibir_carta(self, carta):
        self.mano.append(carta)
        self.actualizar_puntos()

    def actualizar_puntos(self):
        self.puntos = 0
        ases = 0
        for carta in self.mano:
            valor = carta.valor
            if valor == 1:  # As
                ases += 1
                self.puntos += 11
            elif valor > 10:  # J, Q, K valen 10 puntos
                self.puntos += 10
            else:
                self.puntos += valor

        while ases > 0 and self.puntos > 21:
            self.puntos -= 10
            ases -= 1

    def esta_en_bancarrota(self):
        return self.puntos > 21

    def mostrar_mano(self):
        return [f"{carta.valor} de {carta.palo}" for carta in self.mano]

# Clase Banca
class Banca(Jugador):
    def jugar(self, baraja):
        while self.puntos < 17:
            self.recibir_carta(baraja.repartir_carta())
