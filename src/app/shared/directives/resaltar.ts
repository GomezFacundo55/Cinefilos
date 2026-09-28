import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({ selector: '[appResaltar]' })
export class ResaltarDirective {
  @HostBinding('style.transform') transformacion = 'scale(1)';
  @HostBinding('style.transition') transicion = 'transform 0.2s';

  @HostListener('mouseenter') entrar() { this.transformacion = 'scale(1.03)'; }
  @HostListener('mouseleave') salir() { this.transformacion = 'scale(1)'; }
}