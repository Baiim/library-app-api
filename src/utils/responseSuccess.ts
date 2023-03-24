const responseSuccess = <T>(data?: T, status = 200) => ({
    result: data ?? null,
    status: status,
    message: 'success',
});

export default responseSuccess;
