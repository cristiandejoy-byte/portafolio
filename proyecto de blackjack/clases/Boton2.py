import pygame

class Boton:
    def __init__(self, imagen, x, y):
        self.imagen = pygame.image.load(imagen)
        self.rect = self.imagen.get_rect()
        self.rect.centerx = x
        self.rect.centery = y
    
    def dibujar(self, screen):
        screen.blit(self.imagen, self.rect)
    
    def es_precionado(self):
        mouse_pos = pygame.mouse.get_pos()
        return self.rect.collidepoint(mouse_pos) and pygame.mouse.get_pressed()[0]
