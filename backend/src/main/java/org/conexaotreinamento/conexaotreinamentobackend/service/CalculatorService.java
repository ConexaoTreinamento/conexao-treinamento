package org.conexaotreinamento.conexaotreinamentobackend.service;

import org.springframework.stereotype.Service;

/**
 * Simple calculator service for testing code coverage
 */
@Service
public class CalculatorService {

    /**
     * Add two numbers
     */
    public int add(int a, int b) {
        return a + b;
    }

    /**
     * Subtract two numbers
     */
    public int subtract(int a, int b) {
        return a - b;
    }

    /**
     * Multiply two numbers
     */
    public int multiply(int a, int b) {
        return a * b;
    }

    /**
     * Divide two numbers
     */
    public double divide(int a, int b) {
        if (b == 0) {
            throw new IllegalArgumentException("Cannot divide by zero");
        }
        return (double) a / b;
    }

    /**
     * Check if number is positive
     */
    public boolean isPositive(int number) {
        return number > 0;
    }

    /**
     * Check if number is negative
     */
    public boolean isNegative(int number) {
        return number < 0;
    }

    /**
     * Check if number is even
     */
    public boolean isEven(int number) {
        return number % 2 == 0;
    }

    /**
     * Check if number is odd
     */
    public boolean isOdd(int number) {
        return number % 2 != 0;
    }

    /**
     * Calculate factorial
     */
    public long factorial(int n) {
        if (n < 0) {
            throw new IllegalArgumentException("Factorial is not defined for negative numbers");
        }
        if (n == 0 || n == 1) {
            return 1;
        }
        long result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    /**
     * Calculate power
     */
    public double power(double base, int exponent) {
        return Math.pow(base, exponent);
    }

    /**
     * Find maximum of two numbers
     */
    public int max(int a, int b) {
        return a > b ? a : b;
    }

    /**
     * Find minimum of two numbers
     */
    public int min(int a, int b) {
        return a < b ? a : b;
    }

    /**
     * Calculate absolute value
     */
    public int abs(int number) {
        return number < 0 ? -number : number;
    }
}

