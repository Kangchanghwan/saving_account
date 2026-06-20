import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

describe('App 스모크', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })
  it('제목과 결론 배너가 보인다', () => {
    render(<App />)
    expect(screen.getByText('청년적금 갈아타기 손익계산기')).toBeTruthy()
    expect(screen.getByText(/이득|손해|유리/)).toBeTruthy()
  })
  it('모드 탭 전환이 동작한다', () => {
    render(<App />)
    fireEvent.click(screen.getByText('미래적금 단독 계산'))
    expect(screen.getByRole('tab', { selected: true }).textContent).toContain('미래적금')
  })
  it('도약/미래 2단 컬럼 헤더가 보인다', () => {
    render(<App />)
    expect(screen.getByText('도약계좌')).toBeTruthy()
    expect(screen.getByText('미래적금')).toBeTruthy()
  })
  it('기납입 개월 슬라이더와 남은개월 안내가 보인다', () => {
    render(<App />)
    expect(screen.getByLabelText('기납입 개월')).toBeTruthy()
    expect(screen.getByText(/남은 \d+개월 · 만기 60개월/)).toBeTruthy()
  })
})
