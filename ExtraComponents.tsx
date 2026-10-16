import * as React from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { IStackTokens, Stack } from 'office-ui-fabric-react/lib/Stack';

export const ScreenLoader: React.FunctionComponent = () => {
    const stackTokens: IStackTokens = { childrenGap: 20,};
    return (
        <Stack tokens={stackTokens}>
            <div style={{
                position: 'fixed', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)', padding: '50%', backgroundColor:'rgba(192,192,192,0.1)',
            }} id='LoaderDomForSubgridMap'>
                <Spinner size={SpinnerSize.large} label="Loading..." />
            </div>
        </Stack>
    );
};
