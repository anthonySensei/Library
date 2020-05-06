const Librarian = require('../models/librarian');
const Role = require('../models/role');

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
                        id: manager.dataValues.id,
                        role: roles.MANAGER
                    })
                        .then()
                        .catch();
                })
                .catch();
        });
    });
};
