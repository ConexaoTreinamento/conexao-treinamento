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

    // NOTE: The following methods are NOT tested, causing ~40% COVERAGE:
    // - divide()
    // - isNegative()
    // - isEven()
    // - isOdd()
    // - factorial()
    // - power()
    // - min()
    // - abs()
}

