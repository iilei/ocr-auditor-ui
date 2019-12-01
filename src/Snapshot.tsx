import { Component } from 'react';

export type Props = { range: Array<string>; onReady: (snapshot: string) => void; docView?: any };

class Snapshot extends Component<Props> {
  _Snapshot: { get: Function };

  constructor(props: Readonly<Props>) {
    super(props);
    this._Snapshot = props.docView._plugins.find((p: Record<string, any>) => p.name === 'snapshot');
  }

  componentDidMount(): void {
    if (this.props.range.length) {
      this.getSnapshot();
    }
  }

  componentDidUpdate(prevProps: { range: Array<string> }): void {
    // @ts-ignore
    if (this.props.range.length && this.rangeDiffers(prevProps.range, this.props.range)) {
      this.getSnapshot();
    }
  }

  async getSnapshot() {
    const { range } = this.props;
    const snap = this._Snapshot.get(range, this.props.onReady);
  }

  rangeDiffers = (a?: [string?, string?], b?: [string?, string?]) => {
    const [a0, a1] = a || [];
    const [b0, b1] = b || [];
    return a0 !== b0 || a1 !== b1;
  };

  render() {
    return '';
  }
}

export default Snapshot;
