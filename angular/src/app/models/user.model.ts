export class User {
    id: string;
    name: string;
    email: string;
    image: string;
    password: string;
    admin: boolean;
    librarian: boolean;

    constructor(
        name: string,
        email: string,
        image: string,
        password: string,
    ) {
        this.name = name;
        this.email = email;
        this.image = image;
        this.password = password;
    }
}
