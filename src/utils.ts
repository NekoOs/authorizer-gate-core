const isNullish = (value: any) => value === undefined || value === null;

const isNotNullish = (value: any) => !isNullish(value);

export {
    isNullish,
    isNotNullish,
}