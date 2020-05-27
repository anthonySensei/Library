exports.generateCondition = (
    departmentId,
    loanDate,
    nextDay,
    isShow
) => {
    let departmentCondition = {};
    let dateCondition = {};
    let isShowDebtorsCondition = {};

    if (departmentId) departmentCondition = { departmentId: departmentId };
    if (loanDate)
        dateCondition = {
            loan_time: {
                [Op.between]: [loanDate, nextDay]
            }
        };
    if (isShow === 'true')
        isShowDebtorsCondition = {
            returned_time: null
        };

    return {
        ...departmentCondition,
        ...dateCondition,
        ...isShowDebtorsCondition
    };
};
