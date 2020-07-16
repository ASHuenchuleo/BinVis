export function linspace(init, end, N)
{
    let ans = [];
    let step = (end - init)/N;
    for(let i = 0; i <= N; i++) ans.push(init + i * step);
    return ans;
}

export function repeat(array, times)
{
	var result = [];
	for(var i=0;i<times;i++)
	  result = result.concat(array);
	console.log(result)
	return result;
}