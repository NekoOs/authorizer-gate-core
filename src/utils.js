const isNullish = value => value === undefined || value === null;

const isNotNullish = value => !isNullish(value);

export {
    isNullish,
    isNotNullish,
}