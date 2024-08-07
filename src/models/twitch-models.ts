// Models are partial, just to cover what is needed in the app

export interface TwitchApiStreamsResponse {
  data: StreamData[];
}

export interface StreamData {
  user_login: string;
}
