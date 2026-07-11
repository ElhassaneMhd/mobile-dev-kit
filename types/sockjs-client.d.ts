// Type declaration for sockjs-client
declare module 'sockjs-client' {
  export default class SockJS {
    constructor(url: string, _reserved?: any, options?: any);
    
    onopen: ((ev: Event) => any) | null;
    onmessage: ((ev: MessageEvent) => any) | null;
    onclose: ((ev: CloseEvent) => any) | null;
    onerror: ((ev: Event) => any) | null;
    
    send(data: string): void;
    close(code?: number, reason?: string): void;
    
    readonly readyState: number;
    readonly protocol: string;
    readonly url: string;
  }
}
