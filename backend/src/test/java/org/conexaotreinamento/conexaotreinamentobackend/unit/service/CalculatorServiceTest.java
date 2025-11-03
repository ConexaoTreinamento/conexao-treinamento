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

    // NOTE: The following methods are NOT tested, causing LOW COVERAGE:
    // - multiply()
    // - divide()
    // - isPositive()
    // - isNegative()
    // - isEven()
    // - isOdd()
    // - factorial()
    // - power()
    // - max()
    // - min()
    // - abs()
}

