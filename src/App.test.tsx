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
  it('기납입 금액 모드로 전환하면 금액 슬라이더가 보인다', () => {
    render(<App />)
    expect(screen.queryByLabelText('도약 기납입 금액')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '금액' }))
    expect(screen.getByLabelText('도약 기납입 금액')).toBeTruthy()
  })
  it('추가 월납입액·남은 납입개월 슬라이더가 보인다', () => {
    render(<App />)
    expect(screen.getByLabelText('도약 추가 월납입액')).toBeTruthy()
    expect(screen.getByLabelText('도약 남은 납입개월')).toBeTruthy()
  })
})
