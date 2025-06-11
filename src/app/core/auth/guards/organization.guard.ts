import { CanActivateChildFn } from '@angular/router';

export const organizationGuard: CanActivateChildFn = (childRoute, state) => {
  return true;
};
