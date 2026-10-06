export const addZero = (n: number): string => n < 10 ? '0' + n : '' + n
export const formatDate = (dateStr: string, showTime = true, sep = '/'): string => {
  const date = new Date(dateStr)
  let dateResult = `${addZero(date.getDate())}${sep}${addZero(date.getMonth() + 1)}${sep}${date.getFullYear()}`
  if (showTime) dateResult += ` ${addZero(date.getHours())}:${addZero(date.getMinutes())}`
  return dateResult
}

export const generatePassword = (len = 10) => {
  const availChars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHIJKMNPQRSTUVWXYZ123456789!@#$%^&*()_-'
  let pass = ''
  for(let i=0;i<len;i++){
    pass += availChars.charAt(Math.floor(Math.random() * availChars.length))
  }
  return pass
}