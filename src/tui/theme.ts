import chalk from 'chalk';

export const colors = {
  primary: chalk.white,
  secondary: chalk.white,
  secondaryDim: chalk.dim.white,
  success: chalk.white,
  danger: chalk.white,
  warning: chalk.white,
  background: chalk.bgBlack,
};

export const symbols = {
  pointer: chalk.white('❯'),
  bullet: '●',
  checkboxOn: chalk.white('✔'),
  checkboxOff: chalk.dim('✖'),
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
