package org.conexaotreinamento.conexaotreinamentobackend.unit.service;

import org.conexaotreinamento.conexaotreinamentobackend.service.CalculatorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test with LOW COVERAGE - only tests 2 out of 13 methods (~15% coverage)
 * This will make the pipeline FAIL due to coverage below 50%
 */
class CalculatorServiceTest {

    private CalculatorService calculatorService;

    @BeforeEach
    void setUp() {
        calculatorService = new CalculatorService();
    }

    @Test
    void testAdd() {
        // Test basic addition
        assertEquals(5, calculatorService.add(2, 3));
        assertEquals(0, calculatorService.add(-1, 1));
        assertEquals(-5, calculatorService.add(-2, -3));
    }

    @Test
    void testSubtract() {
        // Test basic subtraction
        assertEquals(1, calculatorService.subtract(3, 2));
        assertEquals(-2, calculatorService.subtract(-1, 1));
    }

    @Test
    void testMultiply() {
        // Test basic multiplication
        assertEquals(6, calculatorService.multiply(2, 3));
        assertEquals(-6, calculatorService.multiply(-2, 3));
        assertEquals(0, calculatorService.multiply(5, 0));
    }

    @Test
    void testIsPositive() {
        // Test positive number check
        assertTrue(calculatorService.isPositive(5));
        assertFalse(calculatorService.isPositive(-5));
        assertFalse(calculatorService.isPositive(0));
    }

    @Test
    void testMax() {
        // Test finding maximum
        assertEquals(5, calculatorService.max(3, 5));
        assertEquals(10, calculatorService.max(10, -5));
        assertEquals(0, calculatorService.max(0, 0));
    }

    @Test
    void testDivide() {
        // Test basic division
        assertEquals(2.0, calculatorService.divide(6, 3));
        assertEquals(2.5, calculatorService.divide(5, 2));
        assertEquals(-2.0, calculatorService.divide(6, -3));
        assertEquals(0.0, calculatorService.divide(0, 5));
    }

    @Test
    void testDivideByZero() {
        // Test division by zero throws exception
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            calculatorService.divide(10, 0);
        });
        assertEquals("Cannot divide by zero", exception.getMessage());
    }

    @Test
    void testIsNegative() {
        // Test negative number check
        assertTrue(calculatorService.isNegative(-5));
        assertFalse(calculatorService.isNegative(5));
        assertFalse(calculatorService.isNegative(0));
    }

    @Test
    void testIsEven() {
        // Test even number check
        assertTrue(calculatorService.isEven(4));
        assertTrue(calculatorService.isEven(0));
        assertTrue(calculatorService.isEven(-2));
        assertFalse(calculatorService.isEven(3));
        assertFalse(calculatorService.isEven(-1));
    }

    @Test
    void testIsOdd() {
        // Test odd number check
        assertTrue(calculatorService.isOdd(3));
        assertTrue(calculatorService.isOdd(-1));
        assertFalse(calculatorService.isOdd(4));
        assertFalse(calculatorService.isOdd(0));
        assertFalse(calculatorService.isOdd(-2));
    }

    @Test
    void testFactorial() {
        // Test factorial calculation
        assertEquals(1, calculatorService.factorial(0));
        assertEquals(1, calculatorService.factorial(1));
        assertEquals(2, calculatorService.factorial(2));
        assertEquals(6, calculatorService.factorial(3));
        assertEquals(24, calculatorService.factorial(4));
        assertEquals(120, calculatorService.factorial(5));
    }

    @Test
    void testFactorialNegative() {
        // Test factorial with negative number throws exception
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            calculatorService.factorial(-1);
        });
        assertEquals("Factorial is not defined for negative numbers", exception.getMessage());
    }

    @Test
    void testPower() {
        // Test power calculation
        assertEquals(8.0, calculatorService.power(2, 3));
        assertEquals(1.0, calculatorService.power(5, 0));
        assertEquals(0.25, calculatorService.power(2, -2));
        assertEquals(27.0, calculatorService.power(3, 3));
    }

    @Test
    void testMin() {
        // Test finding minimum
        assertEquals(3, calculatorService.min(3, 5));
        assertEquals(-5, calculatorService.min(10, -5));
        assertEquals(0, calculatorService.min(0, 0));
        assertEquals(-10, calculatorService.min(-5, -10));
    }

    @Test
    void testAbs() {
        // Test absolute value
        assertEquals(5, calculatorService.abs(5));
        assertEquals(5, calculatorService.abs(-5));
        assertEquals(0, calculatorService.abs(0));
        assertEquals(100, calculatorService.abs(-100));
    }

    // ✅ 100% COVERAGE - All methods tested!
}

