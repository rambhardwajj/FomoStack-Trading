export interface Order {
    timeStamp : string,
    quantity: number, 
}

export interface Position extends Order {
    entry : string, 
    exit : string, 
    asset: string, 
    amount : number, 
}
export interface Balance{
    usd: string, 
    btc: string, 
    sol: string,
    eth: string 
}

export interface User {
    username: string, 
    email: string, 
    password: string, 
    picture: string,
    balance: Balance,
    orderHistory: number,
    positions: Position[],
}


