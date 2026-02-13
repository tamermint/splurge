export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class ForecastError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ForecastError';
    }
}

export class DateMappingError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DateMappingError';
    }
}

export class CalculationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CalculationError';
    }
}

export class ScheduleError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ScheduleError';
    }
}