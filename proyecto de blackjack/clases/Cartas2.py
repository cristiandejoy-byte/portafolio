import pygame

class Cartas:
    def __init__(self, valor, palo, imagen):
        self.valor = valor
        self.palo = palo
        self.imagen = imagen

    def dibujar(self, screen, x, y):
        carta_img = pygame.image.load(self.imagen)
        nuevo_ancho = int(carta_img.get_width() / 3)
        nuevo_alto = int(carta_img.get_height() / 3)
        imagen_escalada = pygame.transform.scale(carta_img, (nuevo_ancho, nuevo_alto))
        rect = imagen_escalada.get_rect()
        rect.centerx = x
        rect.centery = y
        screen.blit(imagen_escalada, rect)
