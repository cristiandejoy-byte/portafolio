import pygame

class Jugador:
    def __init__(self, nombre):
        self.nombre = nombre
        self.mano = []
        self.puntos = 0
        self.terminado = False
        self.x = 200
        self.y = 550

    def dibujar(self, screen):
        if self.visible:
            for carta in self.mano:
                carta.dibujar(screen, self.x, self.y)
                self.x += 50

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
