export default cancellablePromise = (promise) => {

    const isCancelled = { value: false };

    const wrappedPromise = new Promise((resolve, reject) => {

        promise.then(data => {
                return isCancelled.value ? reject(isCancelled) : resolve(data);
            }).catch(error => {
                reject(isCancelled.value ? isCancelled : error);
            });
    });

    return {
        promise: wrappedPromise,
        cancel: () => {
            isCancelled.value = true;
        }
    };
};