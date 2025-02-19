import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";

@Injectable()
export class PlatformService {
  private _isBrowser: boolean;
  private _isServer: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this._isBrowser = isPlatformBrowser(platformId);
    this._isServer = isPlatformServer(platformId);
    if (this.isBrowser === this.isServer) {
      throw new Error(
        `[PlatformService] Platform is ${this.isServer ? "simultaneously server and browser" : "neither server nor browser"}`,
      );
    }
  }

  get isBrowser() {
    return this._isBrowser;
  }

  get isServer() {
    return this._isServer;
  }
}
