import pygame
class Botones:
    def __init__(self, imagen, x, y):
        self.imagen = imagen
        self.visible = True
        self.visibleTexto = False
        self.x = x
        self.y = y
        self.boton = pygame.image.load(self.imagen)
        self.boton = pygame.transform.scale(self.boton, (500, 500))
        self.rect = self.boton.get_rect()
        self.rect.centerx = x
        self.rect.centery = y
        self.fuente = pygame.font.Font(None, 36)

    def dibujar(self, screen):
        if self.visible:
            screen.blit(self.boton, self.rect)

    def escalarBoton(self, screen, x, y):
        if self.visible:
            nuevo_ancho = int(self.boton.get_width()/3)
            nuevo_alto = int(self.boton.get_height()/3)
            imagenEscalada = pygame.transform.scale(self.boton, (nuevo_ancho, nuevo_alto))
            self.rect = imagenEscalada.get_rect()
            self.rect.centerx = x
            self.rect.centery = y
            screen.blit(imagenEscalada, self.rect)

        

    def esPrecionado(self):
        mouse = pygame.mouse.get_pos()
        return self.rect.collidepoint(mouse)
    
    def click(self):
        print("fue clickeado!")


    # Método para ocultar el botón
    def ocultar(self):
        self.visible = False
        self.rect.centerx = 10000
        self.rect.centery = 650

    def desocultar(self):
        self.visible = True
        self.rect.centerx = 700
        self.rect.centery = 650

    # Método para mostrar el botón
    def mostrar(self):
        self.visible = True  # Cambia la bandera para mostrar
        self.visibleTexto = True


    # Método para escribir texto en la pantalla
    def escribir_texto(self, screen, texto, color):
        if self.visibleTexto:
            superficie_texto = self.fuente.render(texto, True, color)
            rect_texto = superficie_texto.get_rect()
            rect_texto.center = (self.x, self.y)  # Centrar el texto en las coordenadas x, y
            screen.blit(superficie_texto, rect_texto)

    def texto_derrota(self, screen, texto, color):
        if self.visibleTexto:
            superficie_texto = self.fuente.render(texto, True, color)
            rect_texto = superficie_texto.get_rect()
            rect_texto.center = (self.x, self.y)  # Centrar el texto en las coordenadas x, y
            screen.blit(superficie_texto, rect_texto)