import {io} from "socket.io-client";
import { api_base_url } from "../constants/constant";
export const socket = io(api_base_url)