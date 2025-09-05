import { useEffect, useState } from "react"

/**
 * Debounce genérico de valores. Retorna o valor apenas após `delay` ms sem mudanças.
 * Útil para reduzir requisições/efeitos quando o usuário digita ou altera filtros.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}

export default useDebounce

