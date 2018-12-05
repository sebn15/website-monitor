/**
 * @author Sébastien Haentjens
 */

const asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(index, array);
    }
}

module.exports = {asyncForEach}