import { LIST_SEPARATOR } from "./config"

export const getAccountPath = id => `/accounts/${id}`
export const getTodoListPath = label => `/list/${label.split(LIST_SEPARATOR)[1]}`