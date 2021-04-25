const Librarian = require('../schemas/librarian');
const Role = require('../schemas/role');

const roles = require('../constants/roles');

const bcrypt = require('bcryptjs');

exports.createManager = (name, email, password, departmentId) => {
    const manager = new Librarian({
        name: name,
        email: email,
        password: password,
        departmentId: departmentId
    });
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(manager.password, salt, (err, hash) => {
            manager.password = hash;
            manager
                .save()
                .then(manager => {
                    Role.create({
                        librarian_id: manager.dataValues.id,
                        role: roles.MANAGER
                    })
                        .then()
                        .catch();
                })
                .catch();
        });
    });
};
