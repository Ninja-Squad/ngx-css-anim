import { Injectable } from '@angular/core';

/**
 * Service allowing to globally configure the behavior of the animate directive.
 * It's typically used in tests: by injecting this service and setting the `animationsDisabled`
 * flag to `true`, it makes all the animations triggered by the animate directive synchronous.
 * If you call the animate function directly, without using the directive, it's a good idea to honor
 * the `animationsDisabled` flag of this service, too.
 */
@Injectable({
  providedIn: 'root'
})
export class AnimationConfig {
  animationsDisabled = false;
}
