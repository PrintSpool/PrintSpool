#include <sys/ioctl.h>
#include <termios.h>
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <time.h>

int setdtrrts (int fd, int on)
{
  int controlbits = TIOCM_DTR | TIOCM_RTS;
  if(on)
    return(ioctl(fd, TIOCMBIC, &controlbits));
  else
    return(ioctl(fd, TIOCMBIS, &controlbits));
} 

int main(int argc, char *argv[])
{
  const char *dev=argv[1];

  // Termios Settings
  struct termios tio;
  struct timespec tim, tim2;
  memset(&tio,0,sizeof(tio));
  tio.c_iflag=0;
  tio.c_oflag=0;
  tio.c_cflag=CS8|CREAD|CLOCAL;           // 8n1, see termios.h for more information
  tio.c_lflag=0;
  tio.c_cc[VMIN]=1;
  tio.c_cc[VTIME]=5;

  fflush(stdout);
  int fd=open(dev, O_RDWR | O_NOCTTY | O_NONBLOCK);
  fflush(stdout);
  if(fd<0)
  {
    fprintf(stderr,"Couldn't open %s\n",dev);
    return(1);
  }
  cfsetospeed(&tio,B115200);            // 115200 baud
  cfsetispeed(&tio,B115200);            // 115200 baud
  tcsetattr(fd,TCSANOW,&tio);

  if(argc > 2 && (strcmp(argv[2], "--clear") == 0))
  {
    printf("Clearing DTR.................");
    fflush(stdout);
    setdtrrts(fd,0);

    // Pause for 200ms
    tim.tv_sec = 0;
    tim.tv_nsec = 200;
    nanosleep(&tim, &tim2);
    printf(" [ DONE ]\n");
  }

  printf("Setting DTR..................");
  fflush(stdout);
  setdtrrts(fd,1);
  printf(" [ DONE ]\n");

  // unsigned char c='D';
  // while (c!='q')
  // {
  //         if (read(fd,&c,1)>0)        printf("%c", c);              // if new data is available on the serial port, print it out
  // }

  close(fd);
  return(0);
}