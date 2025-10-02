package org.conexaotreinamento.conexaotreinamentobackend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.conexaotreinamento.conexaotreinamentobackend.config.TestContainerConfig;
import org.springframework.context.annotation.Import;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainerConfig.class)
class ConexaoTreinamentoBackendApplicationTests
{

    @Test
    void contextLoads()
    {
    }

}
