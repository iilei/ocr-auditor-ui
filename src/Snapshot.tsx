import { Component } from 'react';

export type Props = { range: Array<string>; onReady: (snapshot: string) => void; docView?: any };

class Snapshot extends Component<Props> {
  static displayName = 'Snapshot';
  private _getSnapshot: Function | undefined;

  componentDidMount(): void {
    this.bindSnapshotGetter();
    this.getSnapshot().then();
  }

  bindSnapshotGetter = () => {
    if (this.props.docView && this.props.docView._plugins) {
      this._getSnapshot = this.props.docView._plugins.find((p: Record<string, any>) => p.name === 'snapshot').get;
    }
  };

  componentDidUpdate(prevProps: Props): void {
    if (!prevProps.docView || !prevProps.docView._plugins) {
      this.bindSnapshotGetter();
      this.getSnapshot().then();
    }

    // @ts-ignore
    if (this.props.range.length && this.rangeDiffers(prevProps.range, this.props.range)) {
      this.getSnapshot().then();
    }
  }

  async getSnapshot() {
    const { range, onReady = () => null } = this.props;
    if (range.length && this._getSnapshot) {
      this._getSnapshot(range, onReady);
    }
  }

  rangeDiffers = (a?: [string?, string?], b?: [string?, string?]) => {
    const [a0, a1] = a || [];
    const [b0, b1] = b || [];
    return a0 !== b0 || a1 !== b1;
  };

  render() {
    return null;
  }
}

export default Snapshot;
