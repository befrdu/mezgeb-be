const pool = require('../../config/database');

module.exports = {
    create: (data, callBack) => {
        pool.query(
            `INSERT INTO public."user" (user_name,user_type, first_name, last_name, status, password, created_date, updated_date)
                    values($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                data.userName,
                data.userType,
                data.firstName,
                data.lastName,
                data.status,
                data.password,
                data.createdDate,
                data.updatedDate
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getUsers: callBack => {
        pool.query(
            `select user_name as "userName", concat(first_name,' ', last_name) as "displayName" from "user" u ;`,
            [],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getUserById: (id, callBack) => {
        pool.query(
            `select * from "user" where id = $1`,
            [id],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    updateUser: (data, callBack) => {
        pool.query(
            `update "user" set user_name=$1, first_name=$2, last_name=$3, password=$4, password=$5, updatedDate=$6 where id = $7`,
            [
                data.userName,
                data.firstName,
                data.lastName,
                data.password,
                data.status,
                data.updatedDate,
                data.id
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    deleteUser: (data, callBack) => {
        pool.query(
            `delete from "user" where id = $1`,
            [data.id],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getUserByUserName: (userName, callBack) => {
        pool.query(
            `select * from "user" where user_name = $1`,
            [userName],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    createUserLog: (data, callBack) => {    
        pool.query(
            `INSERT INTO user_log (user_name, activity, activity_date, other_details)
                    values($1, $2, $3, $4)`,
            [
                data.userName,
                data.activity,
                data.activityDate,
                data.otherDetails
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getUserLog: callBack => {
        pool.query(
            `select * from user_log`,
            [],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getUserLogByUserName: (userName, callBack) => {
        pool.query(
            `select * from user_log where user_name = $1`,
            [userName],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    }, 
    saveUserLogInDetails: (data, callBack) => {    
        pool.query(
            `INSERT INTO user_login_detail (user_name, r_roken, created_on, other_details)
                    values($1, $2, $3, $4)`,
            [
                data.userName,
                data.refreshToken,
                new Date(),
                data.otherDetails
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    getUserLogInDetailsByUserName: (userName, callBack) => {
        pool.query(
            `select * from user_login_detail where user_name = $1`,
            [userName],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    deleteUserLogInDetails: (userName, callBack) => {
        pool.query(
            `delete from user_login_detail where user_name = $1`,
            [userName],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },

    updateUserLogInDetails: (data, callBack) => {
        pool.query(
            `update user_login_detail set r_token=$1, updated_on=$2 where user_name = $3`,
            [
                data.refreshToken,
                new Date(),
                data.userName
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    }
};



