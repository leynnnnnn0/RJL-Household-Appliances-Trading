import { SVGAttributes } from 'react';
import Logo from '../../images/logo.png';
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <img src={Logo} alt="App Logo" className='h-24' />
    );
}
