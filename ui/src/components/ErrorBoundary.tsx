import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean, error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'var(--bg)' }}>
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'color-mix(in srgb, var(--danger) 15%, transparent)' }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="var(--danger)" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>出现了意外错误</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--btn-bg)', color: 'var(--btn-color)' }}
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }
}
