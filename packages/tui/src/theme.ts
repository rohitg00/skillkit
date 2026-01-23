import chalk from 'chalk';

export const colors = {
  primary: 'white',
  secondary: 'white',
  secondaryDim: 'gray',
  success: 'white',
  danger: 'white',
  warning: 'white',
  background: 'bgBlack',
  borderDim: 'gray',
};

export const symbols = {
  pointer: chalk.white('❯'),
  bullet: '●',
  checkboxOn: chalk.white('✔'),
  checkboxOff: chalk.dim('✖'),
  check: chalk.white('✓'),
  star: '★',
  spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
};

export const logo = `
███████╗██╗  ██╗██╗██╗     ██╗     ██╗  ██╗██╗████████╗
██╔════╝██║ ██╔╝██║██║     ██║     ██║ ██╔╝██║╚══██╔══╝
███████╗█████╔╝ ██║██║     ██║     █████╔╝ ██║   ██║
╚════██║██╔═██╗ ██║██║     ██║     ██╔═██╗ ██║   ██║
███████║██║  ██╗██║███████╗███████╗██║  ██╗██║   ██║
╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝
`;
