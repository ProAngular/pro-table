import {
  AUTO_STYLE,
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

const animationDuration = 100;

export const TABLE_ANIMATIONS = [
  trigger('collapseAnimation', [
    state('expanded', style({ height: AUTO_STYLE, visibility: AUTO_STYLE })),
    state('collapsed', style({ height: '0', visibility: 'hidden' })),
    transition(
      'expanded => collapsed',
      animate(`${animationDuration}ms ease-in`),
    ),
    transition(
      'collapsed => expanded',
      animate(`${animationDuration}ms ease-out`),
    ),
  ]),
  trigger('exitAnimation', [
    transition(':leave', [
      style({ transform: 'translateX(0)', opacity: 1 }),
      animate(
        `${animationDuration}ms`,
        style({ transform: 'translateX(100%)', opacity: 0 }),
      ),
    ]),
  ]),
];
