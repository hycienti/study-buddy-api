export interface ISignUp {
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    userAccountType: "Sender" | "Traveler";
}