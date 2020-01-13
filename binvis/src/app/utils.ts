export function linspace(init, end, N)
  {
      let ans = [];
      let step = (end - init)/N;
      for(let i = 0; i <= N; i++) ans.push(init + i * step);
      return ans;
  }
