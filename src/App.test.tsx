import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('App 스모크', () => {
  it('제목과 결론 배너가 보인다', () => {
    render(<App />)
    expect(screen.getByText('청년적금 갈아타기 손익계산기')).toBeTruthy()
    expect(screen.getByText(/이득|손해|유리/)).toBeTruthy()
  })
  it('모드 탭 전환이 동작한다', () => {
    render(<App />)
    fireEvent.click(screen.getByText('🆕 신규 가입 비교'))
    expect(screen.getByRole('tab', { selected: true }).textContent).toContain('신규')
  })
})
